Feature: Reliability (production subset of product outcomes)
  Production reliability is a subset of product outcomes — shown as direction of travel,
  never an SLA pass/fail badge.

  Scenario Outline: reliability tracks the production measures
    Given the reliability signal
    Then it includes a "<measure>" metric
    And that metric reports movement, not a target

    Examples:
      | measure    |
      | Uptime     |
      | MTTR       |
      | Incidents  |
      | Error rate |

  Scenario: reliability is the freshest signal
    Given the reliability signal
    Then the signal is fresh

  Scenario: every reliability measure carries a multi-point series
    Given the reliability signal
    Then every measure has a series of at least three points
    And each series ends with the current value
