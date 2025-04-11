import csv

NETWORK_INFRASTRUCTURE = []
CUSTOMERS = []
TELEMETRY_DOWNTIME_LOG = []

def load_csv_to_table(csv_filename, table):
    with open(csv_filename, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader)  
        for row in reader:
            table.append(row)
    print(f"Dane z {csv_filename} zostały wczytane do tabeli.")

load_csv_to_table("1_NetworkInfrastructure.csv", NETWORK_INFRASTRUCTURE)
load_csv_to_table("2_Customers.csv", CUSTOMERS)
load_csv_to_table("3_TelemetryDowntimeLog.csv", TELEMETRY_DOWNTIME_LOG)

def return_table(table):
    return table

if __name__ == "__main__":
    print("NETWORK_INFRASTRUCTURE:", NETWORK_INFRASTRUCTURE[:3])
    print("CUSTOMERS:", CUSTOMERS[:3])
    print("TELEMETRY_DOWNTIME_LOG:", TELEMETRY_DOWNTIME_LOG[:3])
