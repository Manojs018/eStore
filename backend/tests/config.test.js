
describe('Environment Configuration', () => {
    let originalEnv;
    let mockExit;
    let mockLogger;
    let validateEnv;

    beforeEach(() => {
        jest.resetModules();
        originalEnv = { ...process.env };
        mockExit = jest.spyOn(process, 'exit').mockImplementation(() => { });
        // Mock logger methods to avoid writing to files during verify
        jest.mock('../utils/logger', () => ({
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn()
        }));
    });

    afterEach(() => {
        process.env = originalEnv;
        mockExit.mockRestore();
        jest.clearAllMocks();
    });

    it('should pass if all required variables are present', () => {
        process.env.MONGO_URI = 'mongodb://localhost:27017/test';
        process.env.JWT_SECRET = 'testsecret';

        validateEnv = require('../config/validateEnv');
        validateEnv();

        expect(mockExit).not.toHaveBeenCalled();
    });

    it('should exit if MONGO_URI is missing', () => {
        delete process.env.MONGO_URI;
        process.env.JWT_SECRET = 'testsecret';

        validateEnv = require('../config/validateEnv');
        validateEnv();

        expect(mockExit).toHaveBeenCalledWith(1);
    });

    it('should exit if JWT_SECRET is missing', () => {
        process.env.MONGO_URI = 'mongodb://localhost:27017/test';
        delete process.env.JWT_SECRET;

        validateEnv = require('../config/validateEnv');
        validateEnv();

        expect(mockExit).toHaveBeenCalledWith(1);
    });
});
