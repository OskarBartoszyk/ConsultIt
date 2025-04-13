// Tab switching functionality
document.addEventListener('DOMContentLoaded', function() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all content sections
            document.querySelectorAll('.content-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Show the corresponding content section
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-section').classList.add('active');
        });
    });
    
    // Form submission (prevent default for demo)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Dziękujemy za przesłanie formularza! Skontaktujemy się wkrótce.');
            this.reset();
        });
    }
    
    // Create modal HTML
    const modalHTML = `
    <div id="order-modal" class="modal">
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>Zamów <span id="plan-name"></span></h2>
            <form id="order-form">
                <div class="form-group">
                    <label for="contract-type">Rodzaj umowy:</label>
                    <select id="contract-type" required>
                        <option value="">Wybierz...</option>
                        <option value="monthly">Miesięczna</option>
                        <option value="6months">6-miesięczna</option>
                        <option value="12months">12-miesięczna</option>
                        <option value="24months">24-miesięczna</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="first-name">Imię:</label>
                    <input type="text" id="first-name" required>
                </div>
                <div class="form-group">
                    <label for="last-name">Nazwisko:</label>
                    <input type="text" id="last-name" required>
                </div>
                <div class="form-group">
                    <label for="phone">Numer telefonu:</label>
                    <input type="tel" id="phone" required>
                </div>
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" required>
                </div>
                <input type="hidden" id="plan-id">
                <button type="submit" class="submit-btn">Zamów teraz</button>
            </form>
        </div>
    </div>`;
    
    // Append modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Get modal elements
    const modal = document.getElementById('order-modal');
    const closeBtn = document.querySelector('.close-modal');
    const orderForm = document.getElementById('order-form');
    
    // Close modal when clicking on X
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Order button click handler
    const orderButtons = document.querySelectorAll('.order-button button');
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Get the plan info
            const planCard = this.closest('.plan-card');
            const planTitle = planCard.querySelector('.plan-title').textContent;
            
            // Set plan name in modal
            document.getElementById('plan-name').textContent = planTitle;
            
            // Store plan ID (using class name for this example)
            const planId = Array.from(planCard.classList)
                .find(cls => cls !== 'plan-card' && cls !== 'plan-wide');
            document.getElementById('plan-id').value = planId;
            
            // Display modal
            modal.style.display = 'block';
        });
    });
    
    // Handle order form submission
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            planId: document.getElementById('plan-id').value,
            planName: document.getElementById('plan-name').textContent,
            contractType: document.getElementById('contract-type').value,
            firstName: document.getElementById('first-name').value,
            lastName: document.getElementById('last-name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value
        };
        
        // Here you would normally send data to your database
        // This is just a placeholder for the actual implementation
        console.log('Order data:', formData);
        sendToDatabase(formData);
        
        // Close modal and show confirmation
        modal.style.display = 'none';
        alert('Dziękujemy za zamówienie! Skontaktujemy się wkrótce w celu potwierdzenia i instalacji.');
        this.reset();
    });
    
// Funkcja sendToDatabase do wstawienia w pliku script.js
function sendToDatabase(data) {
    
}
});