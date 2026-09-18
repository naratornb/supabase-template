import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).parents[1] / "apps" / "api"))
import app  # noqa: E402


class ApiAuthorizationTest(unittest.TestCase):
    def setUp(self):
        app.SUPABASE_URL = "http://supabase"
        app.SUPABASE_SERVICE_ROLE_KEY = "service-key"
        self.client = app.app.test_client()

    def test_users_require_an_admin_token(self):
        self.assertEqual(self.client.get("/users").status_code, 401)

        member = Mock(ok=True)
        member.json.return_value = {"app_metadata": {"role": "member"}}
        with patch("app.requests.get", return_value=member):
            self.assertEqual(
                self.client.get("/users", headers={"Authorization": "Bearer member"}).status_code,
                403,
            )

        admin = Mock(ok=True)
        admin.json.return_value = {"app_metadata": {"role": "admin"}}
        users = Mock(ok=True)
        users.json.return_value = {"users": []}
        with patch("app.requests.get", side_effect=[admin, users]):
            response = self.client.get("/users", headers={"Authorization": "Bearer admin"})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json, {"users": []})


if __name__ == "__main__":
    unittest.main()
