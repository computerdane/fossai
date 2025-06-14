{
  config,
  lib,
  pkgs,
  ...
}:

let
  src = pkgs.stdenv.mkDerivation {
    pname = "fossai";
    version = "0.0.0";

    src = ../.;
    dontBuild = true;

    installPhase = ''
      cp -r $src $out
    '';
  };

  cfg = config.services.fossai;
in
{
  options.services.fossai = {
    enable = lib.mkEnableOption "fossai, an actually free and open source AI chat web UI";
    withPostgres = lib.mkEnableOption "automatic postgres configuration";
    rootDir = lib.mkOption {
      type = lib.types.path;
      default = "/var/lib/fossai";
    };
    backendBaseUrl = lib.mkOption {
      type = lib.types.str;
    };
    frontendPort = lib.mkOption {
      type = lib.types.port;
      default = 5111;
    };
    settings = import ./settings.nix { inherit lib; };
  };

  config = lib.mkIf cfg.enable {

    services.postgresql = lib.mkIf cfg.withPostgres {
      enable = true;
      ensureDatabases = [ "fossai" ];
      ensureUsers = [
        {
          name = "fossai";
          ensureDBOwnership = true;
        }
      ];
    };

    users.users.fossai = {
      isSystemUser = true;
      group = "fossai";
    };
    users.groups.fossai = { };

    systemd.tmpfiles.settings."10-fossai".${cfg.rootDir}.d = {
      user = "fossai";
      group = "fossai";
      mode = "0755";
    };

    systemd.services.fossai = {
      serviceConfig = {
        User = "fossai";
        Group = "fossai";
      };
      wantedBy = [ "multi-user.target" ];
      requires = lib.mkIf cfg.withPostgres [ "postgresql.service" ];
      path = [ pkgs.bun ];
      environment = cfg.settings // {
        VITE_BACKEND_BASE_URL = cfg.backendBaseUrl;
        POSTGRES_CONNECTION_STRING =
          if cfg.withPostgres then "postgres:///fossai?host=/run/postgresql" else null;
      };
      script = ''
        cd "${cfg.rootDir}"
        cp -rf ${src}/* .
        chmod -R ug+rw ./*

        bun i

        cd frontend
        bun run build

        cd ../backend
        bun src/index.ts
      '';
    };

    services.static-web-server = rec {
      enable = true;
      listen = "[::]:${toString cfg.frontendPort}";
      root = "${cfg.rootDir}/frontend/dist";
      configuration.general.page-fallback = "${root}/index.html";
    };
    systemd.services.static-web-server.requires = [ "fossai.service" ];
    systemd.services.static-web-server.after = [ "fossai.service" ];

  };
}
