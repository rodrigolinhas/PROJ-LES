/**
 * Custom function that returns the value of a cookie by its name.
 *
 * @param name - The name of the cookie to retrieve.
 * @returns The cookie value if found; otherwise, an empty string.
 */
export function getCookie(name: string): string {
    const value = "; " + document.cookie;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(";").shift() ?? "";
    }
    return "";
}