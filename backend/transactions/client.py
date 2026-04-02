import plaid
from plaid.api import plaid_api
from django.conf import settings


_PLAID_HOSTS = {
    "sandbox": plaid.Environment.Sandbox,
    "development": plaid.Environment.Development,
    "production": plaid.Environment.Production,
}


def get_plaid_client() -> plaid_api.PlaidApi:
    """Returns a configured PlaidApi client for the configured Plaid environment."""
    plaid_env = (settings.PLAID_ENV or "sandbox").strip().lower()
    if plaid_env not in _PLAID_HOSTS:
        allowed = ", ".join(sorted(_PLAID_HOSTS.keys()))
        raise ValueError(f"Invalid PLAID_ENV '{plaid_env}'. Expected one of: {allowed}.")
    host = _PLAID_HOSTS[plaid_env]

    configuration = plaid.Configuration(
        host=host,
        api_key={
            'clientId': settings.PLAID_CLIENT_ID,
            'secret':   settings.PLAID_SECRET,
        }
    )
    return plaid_api.PlaidApi(plaid.ApiClient(configuration))