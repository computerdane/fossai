{ lib }:

let
  env = builtins.fromJSON (builtins.readFile ../env/env.generated.json);
in

builtins.mapAttrs (
  name:
  {
    description,
    value ? null,
    ...
  }:
  lib.mkOption {
    inherit description;
    type = lib.types.nullOr lib.types.str;
    default = if value == null then null else toString value;
  }
) env
