import json
from datetime import datetime, timedelta
import random
from collections import defaultdict
import sys


def generate_synthetic_data(start_date, end_date):
    """Generates synthetic vehicle registration data."""
    data = []
    current_date = start_date
    manufacturers = ["Maruti Suzuki", "Hyundai", "Tata Motors", "Mahindra", "Honda", "Toyota", "Kia", "MG Motor"]

    while current_date <= end_date:
        date_str = current_date.strftime("%Y-%m-%d")

        daily_total = random.randint(1000, 5000)
        two_wheeler_share_ratio = random.uniform(0.6, 0.75)
        three_wheeler_share_ratio = random.uniform(0.05, 0.1)

        two_wheelers = int(daily_total * two_wheeler_share_ratio)
        three_wheelers = int(daily_total * three_wheeler_share_ratio)
        four_wheelers = daily_total - two_wheelers - three_wheelers

        # Prevent negative counts due to rounding errors
        two_wheelers = max(0, two_wheelers)
        three_wheelers = max(0, three_wheelers)
        four_wheelers = max(0, four_wheelers)

        data.append({
            "date": date_str,
            "2W": two_wheelers,
            "3W": three_wheelers,
            "4W": four_wheelers,
            "total": daily_total,
            "type": "overall"
        })

        # Manufacturer distribution for 4W
        manufacturer_registrations = defaultdict(int)
        remaining_4w = four_wheelers

        base_per_mfg = max(0, remaining_4w // len(manufacturers) // 2)

        # Assign base amounts
        for mfg in manufacturers:
            if remaining_4w <= 0:
                break
            assign_amount = random.randint(0, min(base_per_mfg, remaining_4w))
            manufacturer_registrations[mfg] += assign_amount
            remaining_4w -= assign_amount

        # Distribute remaining registrations randomly
        while remaining_4w > 0:
            mfg = random.choice(manufacturers)
            assign_amount = random.randint(1, min(remaining_4w, 200))
            manufacturer_registrations[mfg] += assign_amount
            remaining_4w -= assign_amount

        # Final adjustment to match exactly 4W
        current_total = sum(manufacturer_registrations.values())
        diff = four_wheelers - current_total
        if diff != 0 and manufacturer_registrations:
            mfg_to_adjust = random.choice(list(manufacturer_registrations.keys()))
            manufacturer_registrations[mfg_to_adjust] += diff
            if manufacturer_registrations[mfg_to_adjust] < 0:
                manufacturer_registrations[mfg_to_adjust] = 0

        for mfg, regs in manufacturer_registrations.items():
            data.append({
                "date": date_str,
                "manufacturer": mfg,
                "registrations": regs,
                "type": "manufacturer"
            })

        current_date += timedelta(days=1)

    return data


def get_quarter_key(date_obj):
    """Return quarter key like '2023-Q1'."""
    return f"{date_obj.year}-Q{((date_obj.month - 1) // 3) + 1}"


def calculate_growth_metrics(data):
    """Calculate YoY and QoQ growth for vehicle types and manufacturers."""

    monthly_vehicle_type_data = defaultdict(lambda: defaultdict(int))
    quarterly_vehicle_type_data = defaultdict(lambda: defaultdict(int))

    monthly_manufacturer_data = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    quarterly_manufacturer_data = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))

    for entry in data:
        date_obj = datetime.strptime(entry["date"], "%Y-%m-%d")
        month_key = date_obj.strftime("%Y-%m")
        quarter_key = get_quarter_key(date_obj)

        if entry.get("type") == "overall":
            for key in ["2W", "3W", "4W", "total"]:
                monthly_vehicle_type_data[month_key][key] += entry[key]
                quarterly_vehicle_type_data[quarter_key][key] += entry[key]
        elif entry.get("type") == "manufacturer":
            mfg = entry["manufacturer"]
            monthly_manufacturer_data[month_key][mfg]["registrations"] += entry["registrations"]
            quarterly_manufacturer_data[quarter_key][mfg]["registrations"] += entry["registrations"]

    processed_vehicle_type_data = []
    sorted_months = sorted(monthly_vehicle_type_data.keys())
    sorted_quarters = sorted(quarterly_vehicle_type_data.keys(), key=lambda q: (int(q.split("-")[0]), int(q.split("Q")[1])))

    for month_key in sorted_months:
        current_year = int(month_key.split('-')[0])
        current_month = int(month_key.split('-')[1])
        prev_year_month_key = f"{current_year - 1}-{current_month:02d}"

        yoy_growth = 0.0
        if prev_year_month_key in monthly_vehicle_type_data and monthly_vehicle_type_data[prev_year_month_key]["total"] > 0:
            yoy_growth = ((monthly_vehicle_type_data[month_key]["total"] - monthly_vehicle_type_data[prev_year_month_key]["total"]) /
                          monthly_vehicle_type_data[prev_year_month_key]["total"]) * 100

        current_date_obj = datetime.strptime(f"{month_key}-01", "%Y-%m-%d")
        current_quarter_key = get_quarter_key(current_date_obj)

        qoq_growth = 0.0
        if current_quarter_key in sorted_quarters:
            current_quarter_index = sorted_quarters.index(current_quarter_key)
            if current_quarter_index > 0:
                prev_quarter_key = sorted_quarters[current_quarter_index - 1]
                prev_total = quarterly_vehicle_type_data[prev_quarter_key]["total"]
                if prev_total > 0:
                    qoq_growth = ((quarterly_vehicle_type_data[current_quarter_key]["total"] - prev_total) / prev_total) * 100

        processed_vehicle_type_data.append({
            "date": f"{month_key}-01",
            "2W": monthly_vehicle_type_data[month_key]["2W"],
            "3W": monthly_vehicle_type_data[month_key]["3W"],
            "4W": monthly_vehicle_type_data[month_key]["4W"],
            "total": monthly_vehicle_type_data[month_key]["total"],
            "yoy_growth": yoy_growth,
            "qoq_growth": qoq_growth,
        })

    processed_manufacturer_data = []
    for month_key in sorted_months:
        current_year = int(month_key.split('-')[0])
        current_month = int(month_key.split('-')[1])
        prev_year_month_key = f"{current_year - 1}-{current_month:02d}"

        current_date_obj = datetime.strptime(f"{month_key}-01", "%Y-%m-%d")
        current_quarter_key = get_quarter_key(current_date_obj)

        if current_quarter_key in sorted_quarters:
            current_quarter_index = sorted_quarters.index(current_quarter_key)
        else:
            current_quarter_index = -1

        for mfg, mfg_data in monthly_manufacturer_data[month_key].items():
            yoy_growth = 0.0
            if prev_year_month_key in monthly_manufacturer_data and mfg in monthly_manufacturer_data[prev_year_month_key]:
                prev_regs = monthly_manufacturer_data[prev_year_month_key][mfg]["registrations"]
                if prev_regs > 0:
                    yoy_growth = ((mfg_data["registrations"] - prev_regs) / prev_regs) * 100

            qoq_growth = 0.0
            if current_quarter_index > 0:
                prev_quarter_key = sorted_quarters[current_quarter_index - 1]
                if prev_quarter_key in quarterly_manufacturer_data and mfg in quarterly_manufacturer_data[prev_quarter_key]:
                    prev_quarter_regs = quarterly_manufacturer_data[prev_quarter_key][mfg]["registrations"]
                    if prev_quarter_regs > 0:
                        qoq_growth = ((quarterly_manufacturer_data[current_quarter_key][mfg]["registrations"] - prev_quarter_regs) / prev_quarter_regs) * 100

            processed_manufacturer_data.append({
                "date": f"{month_key}-01",
                "manufacturer": mfg,
                "registrations": mfg_data["registrations"],
                "yoy_growth": yoy_growth,
                "qoq_growth": qoq_growth,
            })

    total_registrations = 0
    total_yoy_growth = 0.0
    total_qoq_growth = 0.0

    if processed_vehicle_type_data:
        latest_data = processed_vehicle_type_data[-1]
        total_registrations = latest_data["total"]
        total_yoy_growth = latest_data["yoy_growth"]
        total_qoq_growth = latest_data["qoq_growth"]

    return {
        "vehicleTypeData": processed_vehicle_type_data,
        "manufacturerData": processed_manufacturer_data,
        "totalRegistrations": total_registrations,
        "totalYoYGrowth": total_yoy_growth,
        "totalQoQGrowth": total_qoq_growth,
    }


if __name__ == "__main__":
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=3 * 365)

        synthetic_data = generate_synthetic_data(start_date, end_date)
        processed_data = calculate_growth_metrics(synthetic_data)
        print(json.dumps(processed_data), flush=True)

    except Exception as e:
        print(f"Python script error: {e}", file=sys.stderr)
        sys.exit(1)
