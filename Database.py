import sqlite3
import csv
import os

def load_csv_to_table(csv_filename, table_name, conn):
    if not os.path.exists(csv_filename):
        print(f"Plik {csv_filename} nie istnieje")
        return
    
    with open(csv_filename, newline='', encoding='utf-8') as csvfile:
        reader = csv.reader(csvfile)
        headers = next(reader) 

        columns = ', '.join([f'"{header}" TEXT' for header in headers])
        create_table_query = f'CREATE TABLE IF NOT EXISTS "{table_name}" ({columns});'
        conn.execute(create_table_query)
        

        placeholders = ', '.join(['?' for _ in headers])
        insert_query = f'INSERT INTO "{table_name}" VALUES ({placeholders});'
        rows = list(reader)
        conn.executemany(insert_query, rows)
        conn.commit()
        print(f"Dane z {csv_filename} zostały wczytane do tabeli {table_name}")

def create_invoices_tables(conn):
    conn.execute('''
        CREATE TABLE IF NOT EXISTS INVOICES (
            INVOICE_ID INTEGER PRIMARY KEY AUTOINCREMENT, 
            CUSTOMER_ID TEXT,
            CUSTOMER_NAME TEXT
        );
    ''')

    conn.execute('''
        CREATE TABLE IF NOT EXISTS INVOICE_LINES (
            INVOICE_ID INTEGER,
            LINE_NUMBER INTEGER,
            TITLE TEXT CHECK(TITLE IN ('Subscription','Rebate')),
            LINE_AMOUNT REAL,
            PRIMARY KEY (INVOICE_ID, LINE_NUMBER),
            FOREIGN KEY (INVOICE_ID) REFERENCES INVOICES(INVOICE_ID)
        );
    ''')
    conn.commit()
    print("Tabele INVOICES oraz INVOICE_LINES zostały utworzone")

def main():
    conn = sqlite3.connect("database.db")
    load_csv_to_table("1_NetworkInfrastructure.csv", "NETWORK_INFRASTRUCTURE", conn)
    load_csv_to_table("2_Customers.csv", "CUSTOMERS", conn)
    load_csv_to_table("3_TelemetryDowntimeLog.csv", "TELEMETRY_DOWNTIME_LOG", conn)
    

    create_invoices_tables(conn)
    
    conn.close()
    print("Operacja zakończona. Baza danych 'database.db' została utworzona i wypełniona")

if __name__ == "__main__":
    main()
