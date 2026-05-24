Feature: Challenge composer
  Cross-sensor patterns become questions framed against the strategy.

  Scenario: the sample strategy fires every applicable cross-sensor challenge
    Given the sample strategy
    When challenges are composed
    Then a focus-mandate challenge is raised
    And a wip-cap challenge is raised
    And a sense-context challenge is raised
    And every challenge carries a freshness and a source

  Scenario: a blank strategy falls back to the mandate gap
    Given a blank strategy
    When challenges are composed
    Then a mandate-gap challenge is raised
