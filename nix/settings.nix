{ lib }:

let
  env = builtins.fromJSON (builtins.readFile ../env/env.generated.json);
in

builtins.mapAttrs (
  name:
  {
    value,
    description,
  }:
  lib.mkOption {
    inherit description;
    type = lib.types.str;
    default = toString value;
  }
) env
