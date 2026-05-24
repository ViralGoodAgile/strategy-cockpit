Feature: Mirrors
  The ten-quality lens turned back on the strategy — observations, never grades.

  Scenario: the lens produces ten verdicts, each linked to a quality
    Given the blank strategy
    When the mirrors are computed
    Then there are ten verdicts
    And each verdict links to a quality

  Scenario: an empty intent is flagged
    Given the blank strategy
    When the mirrors are computed
    Then the intent verdict says it is empty

  Scenario: a will-NOT contradiction is detected in the sample
    Given the sample strategy
    When the mirrors are computed
    Then the coherence verdict mentions a contradiction
