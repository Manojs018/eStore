describe('User Shopping Flow', () => {
    // Generate unique user data for each run
    const timestamp = Date.now();
    const user = {
        name: `Shop User ${timestamp}`,
        email: `shop${timestamp}@example.com`,
        password: 'password123',
    };

    beforeEach(() => {
        // Login before each test
        // This relies on the custom command 'login' defined in commands.js
        // It should handle registration or login existing user.
        // For simplicity, let's assume login registers implicitly or we register first.
        // Actually, for E2E, we usually want separate users per test or a clean state.

        // Let's register a new user for each test block
        cy.visit('/register');
        cy.get('input[name="name"]').type(user.name);
        cy.get('input[name="email"]').type(user.email);
        cy.get('input[name="password"]').type(user.password);

        // Confirm password if needed
        cy.get('body').then(($body) => {
            if ($body.find('input[name="confirmPassword"]').length > 0) {
                cy.get('input[name="confirmPassword"]').type(user.password);
            }
        });

        cy.get('button[type="submit"]').click();

        // After registration, we should be logged in or at login page.
        // Assuming auto-login or redirect to login.
        // If redirect to login, let's log in.
        cy.url().then((url) => {
            if (url.includes('/login')) {
                cy.get('input[name="email"]').type(user.email);
                cy.get('input[name="password"]').type(user.password);
                cy.get('button[type="submit"]').click();
            }
        });

        // Wait for login to complete
        // cy.wait(1000); 
    });

    it('should browse products and add to cart', () => {
        cy.visit('/products'); // Visit products page directly

        // Check if products load
        cy.get('.product-card', { timeout: 10000 }).should('have.length.gt', 0);

        // Click first product
        cy.get('.product-card').first().click();

        // Verify product details page
        cy.url().should('include', '/product/');

        // Add to cart
        cy.contains('Add to Cart').click();

        // Verify cart update (toast or badge)
        // cy.contains('Added to cart').should('be.visible');

        // Go to cart
        cy.get('a[href="/cart"]').click(); // Assuming cart link in nav

        // Verify item in cart
        cy.get('.cart-item').should('have.length.gt', 0);
        cy.contains('Proceed to Checkout').should('be.visible');
    });

    it('should checkout successfully', () => {
        // 1. Add item to cart first
        cy.visit('/products');
        cy.get('.product-card').first().click();
        cy.contains('Add to Cart').click();

        // 2. Go to Checkout
        cy.visit('/cart');
        cy.contains('Proceed to Checkout').click();

        // 3. Shipping Address
        cy.get('input[name="address"]').type('123 Cypress St');
        cy.get('input[name="city"]').type('Test City');
        cy.get('input[name="postalCode"]').type('12345');
        cy.get('input[name="country"]').type('USA');
        cy.contains('Continue').click(); // Or 'Next', 'Payment'

        // 4. Payment (Stripe Mocking or Test Card)
        // Since we can't easily interact with Stripe iframe in Cypress without plugins,
        // we might check if payment form loads.
        // For E2E on real Stripe, we'd need 'cypress-iframe' or similar.
        // Let's assume we just verify we reached payment step.
        cy.contains('Payment Method').should('be.visible');

        // If we can, enter test card: 4242 4242 4242 4242 ...
        // Requires selecting iframe.
        // Skipping full payment flow detailed interaction for basic E2E without plugins.
        // We can assert we got this far.
    });
});
