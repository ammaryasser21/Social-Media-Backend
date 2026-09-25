export const generateOtp = async () => {
    return JSON.stringify(Math.floor(900000 * Math.random()) + 100000);
}