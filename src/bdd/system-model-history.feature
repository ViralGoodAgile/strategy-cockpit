Feature: The system model is a living model over time
  A causal loop diagram is a seed for dialogue, not a fixed finding. Over time links are
  drawn, re-routed and dropped, a belief about a correlation's sign can reverse, and soft
  hypotheses harden toward causation. The model travels like the rest of the dashboard.

  Scenario: the model's "now" equals the live CLD
    Given a seed system model
    When its history is read at "now"
    Then it is exactly today's model

  Scenario: links are drawn over time, so earlier periods are sparser
    Given a seed system model
    Then an earlier period has fewer links than now

  Scenario: a link is re-routed, so earlier and now disagree on direction
    Given a seed system model
    Then an earlier period carries a directed link the present lacks
    And the present carries a directed link that earlier period lacks

  Scenario: confidence matures from hypothesis toward causation
    Given a seed system model that names a causation
    Then an earlier period has fewer causations and more hypotheses than now

  Scenario: a belief about a sign can reverse, coherently
    Given a causal loop whose links all read "+"
    Then an earlier period reads at least one link as "−"
