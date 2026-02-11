# Contributing to eStore

We love your input! We want to make contributing to eStore as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Request Process

1. **Fork the repository** and create your branch from `main`

   ```bash
   git checkout -b feature/amazing-feature
   ```

2. **Set up development environment**

   ```bash
   # Backend setup
   cd backend
   npm install
   cp .env.example .env
   # Update .env with your settings

   # Frontend setup
   cd ../frontend
   npm install
   ```

3. **Create an issue first** - Before starting work on a new feature or bug fix, please create an issue describing what you plan to do. This helps avoid duplicate work and lets maintainers provide guidance.

4. **Make your changes** and commit with clear messages

   ```bash
   git commit -m 'feat: add amazing feature'
   ```

5. **Push to your fork**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request** with:
   - Clear title and description
   - Reference to related issue (closes #123)
   - Screenshots for UI changes
   - Link to your feature branch preview (if available)

### Pull Request Checklist

- [ ] I have created an associated issue (except for minor fixes)
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] All tests pass locally and on CI/CD
- [ ] New and existing unit tests pass locally with my changes

### Testing

Run tests before submitting PR:

**Backend:**

```bash
cd backend
npm test
```

**Frontend:**

```bash
cd frontend
npm test
npm run build
```

### Code Style

- Use ESLint for JavaScript
- Follow existing code patterns
- Write meaningful variable/function names
- Add comments for complex logic

### Commit Messages

Format: `type: subject`

Types:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example: `feat: add product search functionality`

### Issues

When reporting bugs, include:

- Clear title and description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots/logs if applicable
- Your environment (OS, Node version, etc.)

For feature requests:

- Clear description of the feature
- Why you need it
- Possible implementation approaches

### Review Process

1. A maintainer will review your PR
2. They may request changes or ask clarifying questions
3. Once approved, your PR will be merged
4. Your changes will be included in the next release

## 🔧 Troubleshooting

Common issues you might encounter:

### Backend
- **MongoDB Connection Error**: Ensure MongoDB is running locally or your `MONGO_URI` is correct.
- **Test Failures**: Ensure you are not running the server on port 5000 while running tests.
- **Environment Variables**: Check that `.env` is created from `.env.example`.

### Frontend
- **CORS Error**: Ensure the backend is running and `BASE_URL` matches.
- **Module not found**: Try deleting `node_modules` and running `npm install` again.
- **Build Fails**: Check for ESLint errors or unused variables.

## Questions?

- Check existing issues and discussions
- Ask in your PR or create a discussion
- Tag maintainers for urgent questions

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
