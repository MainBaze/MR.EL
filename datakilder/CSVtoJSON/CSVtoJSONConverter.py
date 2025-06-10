import csv
import json
import os

def convert_all_csv_to_json():
    csv_files = [f for f in os.listdir('.') if f.lower().endswith('.csv')]
    if not csv_files:
        print("❌ No CSV files found.")
        return

    for csv_file in csv_files:
        json_file = os.path.splitext(csv_file)[0] + '.json'
        data = []

        with open(csv_file, encoding='utf-8-sig') as f:  # -sig strips BOM automatically
            reader = csv.reader(f, delimiter=';')

            # Find the first non-empty header row
            for row in reader:
                if any(cell.strip() for cell in row):
                    headers = [h.strip() for h in row if h.strip()]
                    break
            else:
                print(f"⚠️ Skipped empty file: {csv_file}")
                continue

            for row in reader:
                if not any(row):  # Skip empty lines
                    continue
                cleaned_row = {
                    headers[i]: row[i].replace(',', '.').strip()
                    for i in range(min(len(headers), len(row)))
                    if i < len(headers) and headers[i]
                }
                data.append(cleaned_row)

        with open(json_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print(f"✅ Converted: {csv_file} → {json_file}")

if __name__ == "__main__":
    convert_all_csv_to_json()
