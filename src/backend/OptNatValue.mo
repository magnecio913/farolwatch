import OQL "mo:caffeineai-oql";

module {
  /// Optional Nat → sentinel 0 when absent.
  public func _toRow(self : ?Nat) : OQL.Value {
    switch self {
      case null { #nat(0) };
      case (?n) { #nat(n) };
    };
  };
};
