Cypress.Commands.add('login', (email, password) => {
    cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: {
            email,
            password,
        },
    }).then((response) => {
        window.localStorage.setItem('token', response.body.token); // Adjust based on API structure
        window.localStorage.setItem('user', JSON.stringify(response.body.user));
        // Visit home or dashboard
        cy.visit('/');
    });
});
