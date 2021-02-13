/**
 * Manage cookies
 */
class CookieManager {
  /**
   * Add a new cookie
   *
   * @param name Cookie name
   * @param value Cookie value
   * @param days Expiry
   */
  static setCookie(name, value, days) {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }

  /**
   * Get the value of a cookie
   *
   * @param name Cookie name
   */
  static getCookie(name) {
    let nameEQ = name + "=";
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  /**
   * Remove a cookie; It will attempt to remove it from all paths
   *
   * @param name Current cookie
   *
   * @src https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
   */
  static eraseCookie(name) {
    const pathBits = location.pathname.split("/");
    let pathCurrent = " path=";

    // do a simple pathless delete first.
    document.cookie = name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;";

    for (let i = 0; i < pathBits.length; i++) {
      pathCurrent += (pathCurrent.substr(-1) != "/" ? "/" : "") + pathBits[i];
      document.cookie =
        name + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT;" + pathCurrent + ";";
    }
  }

  /**
   * Erase all cookies
   */
  static eraseAllCookies() {
    let cookies = document.cookie.split("; ");
    cookies.forEach((cookie) => {
      this.eraseCookie(cookie);
    });
  }
}

export default CookieManager;