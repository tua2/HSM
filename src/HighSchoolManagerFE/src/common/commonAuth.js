class CommonAuth {
  static isInRoles(userRole, allowedRoles) {
    if (!userRole)
      return false;
    return allowedRoles.filter(_role => userRole === _role).length > 0
  }
}

export default CommonAuth;
