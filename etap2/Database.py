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

        # Przyjmujemy, że wszystkie kolumny to TEXT – można to rozbudować o wykrywanie typów
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
    # Tabela INVOICES – dodajemy klucz obcy do CUSTOMERS (jeśli tabela CUSTOMERS posiada kolumnę CUSTOMER_ID)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS INVOICES (
            INVOICE_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CUSTOMER_ID TEXT,
            CUSTOMER_NAME TEXT,
            FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(CUSTOMER_ID)
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

def create_additional_tables(conn):
    # Tabela SUBSCRIPTIONS – rejestracja wykupionych pakietów przez klientów
    conn.execute('''
        CREATE TABLE IF NOT EXISTS SUBSCRIPTIONS (
            SUBSCRIPTION_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CUSTOMER_ID TEXT,
            PACKAGE_NAME TEXT,
            START_DATE TEXT,
            END_DATE TEXT,
            STATUS TEXT CHECK(STATUS IN ('aktywny','zakończony','zawieszony')),
            FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(CUSTOMER_ID)
        );
    ''')

    # Tabela LINK_STATUS – monitorowanie stanu łącza klienta
    conn.execute('''
        CREATE TABLE IF NOT EXISTS LINK_STATUS (
            STATUS_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CUSTOMER_ID TEXT,
            CURRENT_STATUS TEXT CHECK(CURRENT_STATUS IN ('aktywne', 'przerwane', 'w konserwacji')),
            LAST_CHECKED TEXT,
            FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(CUSTOMER_ID)
        );
    ''')

    # Tabela ERROR_LOGS – logi błędów sieciowych
    conn.execute('''
        CREATE TABLE IF NOT EXISTS ERROR_LOGS (
            LOG_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CUSTOMER_ID TEXT,
            ERROR_CODE TEXT,
            MESSAGE TEXT,
            TIMESTAMP TEXT,
            SEVERITY TEXT CHECK(SEVERITY IN ('info', 'warning', 'critical')),
            FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(CUSTOMER_ID)
        );
    ''')

    # Tabela SERVICE_REQUESTS – zgłoszenia serwisowe od klientów/pracowników
    conn.execute('''
        CREATE TABLE IF NOT EXISTS SERVICE_REQUESTS (
            REQUEST_ID INTEGER PRIMARY KEY AUTOINCREMENT,
            CUSTOMER_ID TEXT,
            DESCRIPTION TEXT,
            STATUS TEXT CHECK(STATUS IN ('otwarte', 'w trakcie', 'zamknięte')),
            PRIORITY TEXT CHECK(PRIORITY IN ('niski', 'średni', 'wysoki')),
            ASSIGNED_TO TEXT,
            CREATED_AT TEXT,
            UPDATED_AT TEXT,
            FOREIGN KEY (CUSTOMER_ID) REFERENCES CUSTOMERS(CUSTOMER_ID)
        );
    ''')
    conn.commit()
    print("Tabele SUBSCRIPTIONS, LINK_STATUS, ERROR_LOGS i SERVICE_REQUESTS zostały utworzone")

def main():
    # Nawiązanie połączenia z bazą
    conn = sqlite3.connect("database.db")
    # Aktywacja sprawdzania kluczy obcych – SQLite domyślnie tego nie wymusza
    conn.execute("PRAGMA foreign_keys = ON;")

    # Ładujemy istniejące dane z plików CSV do odpowiednich tabel
    load_csv_to_table("1_NetworkInfrastructure.csv", "NETWORK_INFRASTRUCTURE", conn)
    load_csv_to_table("2_Customers.csv", "CUSTOMERS", conn)
    load_csv_to_table("3_TelemetryDowntimeLog.csv", "TELEMETRY_DOWNTIME_LOG", conn)

    # Tworzymy tabele faktur
    create_invoices_tables(conn)

    # Tworzymy dodatkowe tabele rozszerzające funkcjonalność bazy danych
    create_additional_tables(conn)

    conn.close()
    print("Operacja zakończona. Baza danych 'database.db' została utworzona i wypełniona")

if __name__ == "__main__":
    main()
