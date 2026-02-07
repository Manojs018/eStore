describe('User Authentication Flow', () => {
    // Generate unique user data for each run
    const timestamp = Date.now();
    const user = {
        name: `TestUser_${timestamp}`,
        email: `test${timestamp}@example.com`,
        password: 'password123',
    };

    it('should register a new user', () => {
        cy.visit('/register'); // Cypress base URL is configured

        // Assuming typical registration form layout
        cy.get('input[name="name"]').type(user.name);
        cy.get('input[name="email"]').type(user.email);
        cy.get('input[name="password"]').type(user.password);

        // Confirm password field if present. If not, this might fail or do nothing if selector not found.
        // Usually safer to check existence first or assume it's there.
        // Let's assume there's a confirm password field.
        cy.get('body').then(($body) => {
            if ($body.find('input[name="confirmPassword"]').length > 0) {
                cy.get('input[name="confirmPassword"]').type(user.password);
            }
        });

        cy.get('button[type="submit"]').click();

        // Expect redirection to login or dashboard
        // If successful, should show success message
        // Or redirect to login
        cy.url().should('include', '/login');
        // Or check for success toast
        // cy.contains('Registration successful', { timeout: 10000 }).should('be.visible');
    });

    it('should login with the registered user', () => {
        cy.visit('/login');

        cy.get('input[name="email"]').type(user.email);
        cy.get('input[name="password"]').type(user.password);
        cy.get('button[type="submit"]').click();

        // Successful login
        // Should redirect to home/dashboard
        cy.url().should('not.include', '/login');

        // Check for user name in header
        cy.contains(user.name).should('exist');
        // Or check for profile icon
        // cy.get('nav').should('contain', 'Profile');
    });

    it('should logout successfully', () => {
        // Login first
        cy.login(user.email, user.password); // Define custom command later

        // Logout
        // Assuming there is a "Logout" button or link
        // May be inside a dropdown
        // Try to click "Logout" directly if visible
        cy.contains('Logout').click({ force: true });

        // Redirect to login or home as guest
        // Token should be removed
        // cy.window().its('localStorage.token').should('not.exist');
        cy.contains('Login').should('be.visible');
    });
});
