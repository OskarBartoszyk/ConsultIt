import sqlite3
import csv
import os

connection = sqlite3.connect("database.db")
cursor = connection.cursor()

invoice_columns = ["INVOICE_ID", "CUSTOMER_ID", "CUSTOMER_NAME"]
invoice_lines_columns = ["INVOICE_ID", "LINE_NUMBER", "TITLE", "LINE_AMOUNT"]

cursor.execute("SELECT * FROM INVOICES")
invoices = cursor.fetchall()

for invoice in invoices:
    invoice_id = invoice[0]
    cursor.execute("SELECT * FROM INVOICE_LINES WHERE INVOICE_ID = ?", (invoice_id,))
    lines = cursor.fetchall()

    subscription_line = None
    rebate_line = None
    for line in lines:
        if line[2] == "Subscription":
            subscription_line = line
        elif line[2] == "Rebate":
            rebate_line = line

    filename = f"invoice_{invoice_id}.csv"
    with open(filename, mode="w", newline='', encoding="utf-8") as csvfile:
        writer = csv.writer(csvfile)

        writer.writerow(invoice_columns)
        writer.writerow(invoice)
        writer.writerow(invoice_lines_columns)
        if subscription_line:
            writer.writerow(subscription_line)
        else:
            writer.writerow(["Brak danych dla Subscription"])
        if rebate_line:
            writer.writerow(rebate_line)
    print(f"Faktura {invoice_id} została wyeksportowana do {filename}")

connection.close()
