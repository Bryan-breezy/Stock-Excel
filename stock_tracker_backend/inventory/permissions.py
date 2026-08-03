from rest_framework.permissions import SAFE_METHODS, BasePermission


def _role(user):
    profile = getattr(user, "profile", None)
    return profile.role if profile else None


class IsViewerOrAbove(BasePermission):
    """Any authenticated user with a profile can read."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsManagerOrAdmin(BasePermission):
    """Viewers get read-only access; Manager/Admin can create and edit.

    Matches the PRD's Admin / Manager / Viewer roles (section 13).
    """

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return _role(request.user) in ("admin", "manager") or request.user.is_superuser


class IsAdmin(BasePermission):
    """Destructive actions (deleting products, managing users) are admin-only."""

    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in SAFE_METHODS:
            return True
        return _role(request.user) == "admin" or request.user.is_superuser
