/* eslint-disable @typescript-eslint/restrict-template-expressions */
class AuthService {
  constructor(realm) {
    this.realm = realm;
    this.baseUrl = "https://api.quickbase.com/v1";
  }

  async getVSProperties(tables) {
    const vsTableName = "VertiGIS Properties";
    const vsTable = tables.find((x) => x.name === vsTableName);

    if (!vsTable) {
      throw new Error("Unable to find table: VertiGIS Properties.");
    }
    const token = await this.authenticate(vsTable.id);

    try {
      const headers = {
        "QB-Realm-Hostname": this.realm,
        "Content-Type": "application/json",
        Authorization: `QB-TEMP-TOKEN ${token}`,
      };
      const body = JSON.stringify({ from: vsTable.id });
      let response = await fetch(`${this.baseUrl}/records/query`, {
        method: "POST",
        headers: headers,
        body: body,
      });

      const records = await response.json();
      if (response.ok) {
        return records;
      } else {
        throw new Error(`Error retrieving VertiGIS Properties.`);
      }
    } catch (error) {
      console.error(`Error retrieving records: ${error}`);
      throw error;
    }
  }
  async getTables(appId) {
    const token = await this.authenticate(appId);
    try {
      const headers = {
        "QB-Realm-Hostname": this.realm,
        "Content-Type": "application/json",
        Authorization: `QB-TEMP-TOKEN ${token}`,
      };
      let response = await fetch(`${this.baseUrl}/tables?appId=${appId}`, {
        method: "GET",
        headers: headers,
      });

      const tables = await response.json();
      if (response.ok) {
        return tables;
      } else {
        throw new Error(`Error retrieving tables.`);
      }
    } catch (error) {
      console.error(`Error retrieving tables: ${error}`);
      throw error;
    }
  }

  async authenticate(id) {
    try {
      const headers = {
        "QB-Realm-Hostname": this.realm,
        "Content-Type": "application/json",
      };

      let response = await fetch(`${this.baseUrl}/auth/temporary/${id}`, {
        method: "GET",
        headers: headers,
        credentials: "include",
      });

      const authToken = await response.json();
      if (response.ok) {
        return authToken.temporaryAuthorization;
      } else {
        throw new Error(
          `Error retrieving temporary authentication token. Status: ${authToken.status}`
        );
      }
    } catch (error) {
      console.error(`Error retrieving temporary authorization token: ${error}`);
      throw error;
    }
  }
}

const init = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const realm = urlParams.get("realm");
  const appId = urlParams.get("appId");

  if (!realm) {
    throw new Error("URL parameter missing: realm");
  }
  if (!appId) {
    throw new Error("URL parameter missing: appId");
  }

  const auth = new AuthService(realm);
  const tables = await auth.getTables(appId);
  const vsProps = await auth.getVSProperties(tables);

  if (vsProps.data.length === 0) {
    throw new Error(`VertiGIS Properties table is empty.`);
  }

  const originField = vsProps.fields.find(
    (x) => x.label.toUpperCase() === "ORIGIN"
  );

  if (!originField) {
    throw new Error(`Origin field not found in table: ${vsProps.id}`);
  }

  const originRecord = vsProps.data[0];
  const originValue = originRecord[originField.id];

  if (!originValue) {
    throw new Error(`Origin value not set in VertiGIS Properties`);
  }

  const origin = originValue.value;

  window.onmessage = async (event) => {
    if (event.origin !== origin) {
      return;
    }
    if (!event.data) {
      return;
    }
    const action = event.data.action;
    const parameters = event.data.parameters;
    if (action === "authenticate") {
      const message = {
        action: "authenticate",
        parameters: {},
      };
      if (parameters && parameters.id) {
        try {
          const token = await auth.authenticate(parameters.id);
          //Set expiration to 5 seconds before to reduce the chance of 403 errors.
          const expiration = Date.now() + 5 * 60 * 1000 - 5000;
          message.parameters = { token, expiration };
        } catch (error) {
          message.parameters = { error };
        }
        event.ports[0].postMessage(message);
      }
    }
  };
};

await init();
