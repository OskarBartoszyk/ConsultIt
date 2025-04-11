import sqlite3
import List

def build_parent_dict(network_data):
    parent_dict = {}
    for row in network_data:
        parent_dict[row[0]] = row[2] if row[2] else None  # PARENT_ACCESS_POINT_ID może być None
    return parent_dict


def get_access_point_chain(customer_access_point, parent_dict):
    chain = []
    current = customer_access_point
    while current:
        chain.append(current)
        parent = parent_dict.get(current)
        if not parent or parent == current:
            break
        current = parent
    return chain

# Liczymy całkowity downtime klienta, jeśli jego punkt dostępowy lub nadzorujące punkty miały awarię
def calculate_discount(customer_access_point, downtime_log, parent_dict, discount_rate=0.1):
    chain = get_access_point_chain(customer_access_point, parent_dict)
    total_discount = 0.0
    for record in downtime_log:
        if record[0] in chain:  # Jeśli awaria dotyczy węzła w ścieżce klienta
            total_discount += float(record[3]) * discount_rate
    return total_discount

# Tworzymy mapę sieci na podstawie NETWORK_INFRASTRUCTURE
parent_dict = build_parent_dict(List.NETWORK_INFRASTRUCTURE)


connection = sqlite3.connect("database.db")
cursor = connection.cursor()


for customer in List.CUSTOMERS:
    cursor.execute('''
        INSERT INTO INVOICES (CUSTOMER_ID, CUSTOMER_NAME)
        VALUES (?, ?)
    ''', (customer[0], customer[1]))

# Pobierz wszystkie faktury 
cursor.execute('SELECT INVOICE_ID, CUSTOMER_ID FROM INVOICES')
invoices = cursor.fetchall()

# Linie faktury
for invoice in invoices:
    invoice_id, customer_id = invoice
    customer_data = next((cust for cust in List.CUSTOMERS if cust[0] == customer_id), None)
    if not customer_data:
        continue

    monthly_amount_due = float(customer_data[3])  # Kwota subskrypcji
    customer_access_point = customer_data[2]  # Punkt dostępowy klienta


    cursor.execute('''
        INSERT INTO INVOICE_LINES (INVOICE_ID, LINE_NUMBER, TITLE, LINE_AMOUNT)
        VALUES (?, ?, ?, ?)
    ''', (invoice_id, 1, "Subscription", monthly_amount_due))


    discount = calculate_discount(customer_access_point, List.TELEMETRY_DOWNTIME_LOG, parent_dict)
    if discount > 0:
        cursor.execute('''
            INSERT INTO INVOICE_LINES (INVOICE_ID, LINE_NUMBER, TITLE, LINE_AMOUNT)
            VALUES (?, ?, ?, ?)
        ''', (invoice_id, 2, "Rebate", -discount))  # Rabat jako wartość ujemna

connection.commit()


cursor.execute('SELECT * FROM INVOICES')
print("INVOICES:")
print(cursor.fetchall())

cursor.execute('SELECT * FROM INVOICE_LINES')
print("INVOICE_LINES:")
print(cursor.fetchall())

cursor.close()
connection.close()