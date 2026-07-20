// /backend/src/utils/validators.ts

const GENERIC_EMAIL_DOMAINS = [
    'gmail.com',
    'yahoo.com',
    'hotmail.com',
    'outlook.com',
    'aol.com',
    'icloud.com',
    'me.com',
    'mac.com',
    'live.com',
    'msn.com',
];

/**
 * Checks if an email is from a generic provider.
 * Returns true if the email is considered generic (e.g. gmail.com)
 */
export const isGenericEmail = (email: string): boolean => {
    try {
        const domain = email.split('@')[1]?.toLowerCase();
        if (!domain) return true;
        return GENERIC_EMAIL_DOMAINS.includes(domain);
    } catch (e) {
        return true; // invalid email structure
    }
};
