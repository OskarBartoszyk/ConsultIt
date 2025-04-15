document.addEventListener('DOMContentLoaded', function() {
    // Pokazywanie sekcji logowania na początku
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('consultant-interface').style.display = 'none';
    document.getElementById('technician-interface').style.display = 'none';

    // Obsługa formularza logowania
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const role = document.getElementById('role').value;
        
        // W prawdziwej aplikacji tutaj byłaby weryfikacja poświadczeń
        // Dla celów demo pomijamy weryfikację hasła
        
        document.getElementById('user-name').textContent = username;
        document.getElementById('user-role').textContent = role === 'consultant' ? 'Konsultant' : 'Technik';
        
        // Ukryj sekcję logowania
        document.getElementById('login-section').style.display = 'none';
        
        // Pokaż odpowiedni interfejs w zależności od roli
        if (role === 'consultant') {
            document.getElementById('consultant-interface').style.display = 'block';
        } else {
            document.getElementById('technician-interface').style.display = 'block';
        }
    });

    // Obsługa wylogowywania
    document.getElementById('logout-btn').addEventListener('click', function() {
        document.getElementById('login-section').style.display = 'flex';
        document.getElementById('consultant-interface').style.display = 'none';
        document.getElementById('technician-interface').style.display = 'none';
        loginForm.reset();
    });

    // Obsługa przełączania zakładek
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const parentInterface = this.closest('.interface');
            
            // Usuń klasę active ze wszystkich zakładek w tym interfejsie
            parentInterface.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            
            // Dodaj klasę active do klikniętej zakładki
            this.classList.add('active');
            
            // Ukryj wszystkie sekcje zawartości
            parentInterface.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Pokaż odpowiednią sekcję zawartości
            const tabId = this.getAttribute('data-tab');
            parentInterface.querySelector('#' + tabId + '-section').classList.add('active');
        });
    });

    // Obsługa modali
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close-modal');
    
    // Funkcja otwierająca modal
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    
    // Funkcja zamykająca modal
    function closeModal(modal) {
        modal.style.display = 'none';
    }
    
    // Zamykanie modali przez kliknięcie na X
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Zamykanie modali przez kliknięcie poza nimi
    window.addEventListener('click', function(event) {
        modals.forEach(modal => {
            if (event.target === modal) {
                closeModal(modal);
            }
        });
    });

    // Przycisk do otwierania modala zgłoszenia awarii
    document.getElementById('new-outage-btn').addEventListener('click', function() {
        openModal('outage-modal');
    });

    // Przycisk do otwierania modala generowania faktury
    const newInvoiceBtn = document.querySelector('.new-invoice-btn');
    if (newInvoiceBtn) {
        newInvoiceBtn.addEventListener('click', function() {
            openModal('invoice-modal');
        });
    }

    // Obsługa formularza zgłaszania awarii
    const outageForm = document.getElementById('outage-form');
    if (outageForm) {
        outageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Zbierz dane z formularza
            const formData = {
                type: document.getElementById('outage-type').value,
                location: document.getElementById('outage-location').value,
                description: document.getElementById('outage-description').value,
                priority: document.getElementById('outage-priority').value
            };
            
            // Tutaj byłby kod do wysyłania danych do bazy danych
            console.log('Dane awarii:', formData);
            
            // Wyświetl potwierdzenie
            alert('Awaria została zgłoszona pomyślnie.');
            
            // Zamknij modal i wyczyść formularz
            closeModal(document.getElementById('outage-modal'));
            outageForm.reset();
            
            // Dodaj nowy wiersz do tabeli awarii (w prawdziwej aplikacji te dane pochodziłyby z bazy)
            const outagesTable = document.querySelector('#outages-section table tbody');
            const now = new Date();
            const formattedDate = `${now.getDate().toString().padStart(2, '0')}.${(now.getMonth() + 1).toString().padStart(2, '0')}.${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
            
            const typeMap = {
                connection: 'Przerwane łącze',
                hardware: 'Awaria sprzętu',
                software: 'Problem z oprogramowaniem',
                power: 'Brak zasilania'
            };
            
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>OUT_${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</td>
                <td>${typeMap[formData.type]}</td>
                <td>${formData.location}</td>
                <td><span class="status open">Otwarta</span></td>
                <td><span class="priority ${formData.priority}">${formData.priority === 'low' ? 'Niski' : formData.priority === 'medium' ? 'Średni' : 'Wysoki'}</span></td>
                <td>${formattedDate}</td>
                <td>
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn"><i class="fas fa-edit"></i></button>
                </td>
            `;
            
            outagesTable.prepend(newRow);
        });
    }

    // Obsługa formularza generowania faktur
    const invoiceForm = document.getElementById('invoice-form');
    if (invoiceForm) {
        invoiceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Zbierz dane z formularza
            const formData = {
                client: document.getElementById('invoice-client').value,
                service: document.getElementById('invoice-service').value,
                period: document.getElementById('invoice-period').value,
                date: document.getElementById('invoice-date').value,
                paymentDate: document.getElementById('invoice-payment-date').value,
                notes: document.getElementById('invoice-notes').value
            };
            
            // Tutaj byłby kod do wysyłania danych do bazy danych
            console.log('Dane faktury:', formData);
            
            // Wyświetl potwierdzenie
            alert('Faktura została wygenerowana pomyślnie.');
            
            // Zamknij modal i wyczyść formularz
            closeModal(document.getElementById('invoice-modal'));
            invoiceForm.reset();
            
            // Dodaj nowy wiersz do tabeli faktur (w prawdziwej aplikacji te dane pochodziłyby z bazy)
            const invoicesTable = document.querySelector('#invoices-section table tbody');
            const now = new Date();
            
            // Zamiana formatu daty
            const formatDate = dateString => {
                const date = new Date(dateString);
                return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
            };
            
            // Pobranie nazwy klienta na podstawie ID
            const clientSelect = document.getElementById('invoice-client');
            const clientName = clientSelect.options[clientSelect.selectedIndex].text;
            
            // Pobranie ceny usługi
            const serviceSelect = document.getElementById('invoice-service');
            const serviceText = serviceSelect.options[serviceSelect.selectedIndex].text;
            const servicePrice = serviceText.split(' - ')[1];
            
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>FV/${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}</td>
                <td>${clientName}</td>
                <td>${formatDate(formData.date)}</td>
                <td>${formatDate(formData.paymentDate)}</td>
                <td>${servicePrice}</td>
                <td><span class="status unpaid">Nieopłacona</span></td>
                <td>
                    <button class="view-btn"><i class="fas fa-eye"></i></button>
                    <button class="print-btn"><i class="fas fa-print"></i></button>
                </td>
            `;
            
            invoicesTable.prepend(newRow);
        });
    }
});
