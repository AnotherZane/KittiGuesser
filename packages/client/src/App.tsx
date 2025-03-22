import { useEffect, useState } from "react";
import useAuthStore from "./state/auth";
import { discordSdk } from "./utils/discordSdk";
import { useNavigate } from "react-router";

const SCOPES = [
  // Activities will launch through app commands and interactions of user-installable apps.
  // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
  "applications.commands",
  "identify",
  "guilds",
  "guilds.members.read",
  "rpc.voice.read",
] as (
  | -1
  | "identify"
  | "email"
  | "connections"
  | "guilds"
  | "guilds.join"
  | "guilds.members.read"
  | "guilds.channels.read"
  | "gdm.join"
  | "bot"
  | "rpc"
  | "rpc.notifications.read"
  | "rpc.voice.read"
  | "rpc.voice.write"
  | "rpc.video.read"
  | "rpc.video.write"
  | "rpc.screenshare.read"
  | "rpc.screenshare.write"
  | "rpc.activities.write"
  | "webhook.incoming"
  | "messages.read"
  | "applications.builds.upload"
  | "applications.builds.read"
  | "applications.commands"
  | "applications.commands.permissions.update"
  | "applications.commands.update"
  | "applications.store.update"
  | "applications.entitlements"
  | "activities.read"
  | "activities.write"
  | "relationships.read"
  | "relationships.write"
  | "voice"
  | "dm_channels.read"
  | "role_connections.write"
  | "presences.read"
  | "presences.write"
  | "openid"
  | "dm_channels.messages.read"
  | "dm_channels.messages.write"
  | "gateway.connect"
  | "account.global_name.update"
  | "payment_sources.country_code"
  | "sdk.social_layer"
)[];

function App() {
  // const [count, setCount] = useState(0);

  const auth = useAuthStore((s) => s.auth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const [authFailed, setAuthFailed] = useState(false);

  const navigate = useNavigate();

  const authenticate = () => {
    setAuthFailed(false);
    discordSdk
      .ready()
      .then(async () => {
        const { code } = await discordSdk.commands.authorize({
          client_id: import.meta.env.VITE_CLIENT_ID,
          response_type: "code",
          state: "",
          prompt: "none",
          // More info on scopes here: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
          scope: [
            // Activities will launch through app commands and interactions of user-installable apps.
            // https://discord.com/developers/docs/tutorials/developing-a-user-installable-app#configuring-default-install-settings-adding-default-install-settings
            "applications.commands",
            "identify",
            "guilds",
            "guilds.members.read",
            "rpc.voice.read",
          ],
        });

        // Retrieve an access_token from your activity's server
        // /.proxy/ is prepended here in compliance with CSP
        // see https://discord.com/developers/docs/activities/development-guides#construct-a-full-url
        const response = await fetch("/.proxy/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
          }),
        });
        const { access_token } = await response.json();

        // Authenticate with Discord client (using the access_token)
        const authResponse = await discordSdk.commands.authenticate({
          access_token,
        });

        if (
          authResponse == null ||
          !SCOPES.every((x) => authResponse.scopes.includes(x))
        ) {
          setAuthFailed(true);
          throw new Error("Authenticate command failed");
        } else {
          setAuth(authResponse);
        }
      })
      .catch((err) => {
        if (err.code != 4002) setAuthFailed(true);
        console.log("Error");
        throw err;
      });
  };

  useEffect(() => {
    if (!auth) {
      authenticate();
    }
  }, []);

  return (
    <div className="hero bg-base-200 min-h-screen">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-5xl font-bold">Kitti Guesser</h1>
          <p className="py-6">
            {auth != null
              ? `Found ${auth.user.username}!`
              : authFailed
              ? "Opps! We failed to authenticate you..."
              : "Looking for kitties..."}
          </p>
          {auth && (
            <button
              className="btn btn-primary"
              onClick={() => navigate("/map")}
            >
              Get Started
            </button>
          )}
          {!auth && authFailed && (
            <button className="btn btn-neutral" onClick={authenticate}>
              Retry Authentation
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
