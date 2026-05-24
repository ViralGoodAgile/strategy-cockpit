Feature: Signal freshness
  Every sensor reading carries an as-of; freshness is derived from its age.

  Scenario Outline: freshness from age against the weekly cadence
    Given a signal observed <age> days ago
    When its freshness is evaluated
    Then it is <freshness>

    Examples:
      | age | freshness |
      | 0   | fresh     |
      | 3   | fresh     |
      | 10  | aging     |
      | 30  | stale     |
      | 90  | dead      |

  Scenario: the worst freshness wins
    Given the verdicts fresh, aging and stale
    When the worst is taken
    Then the result is stale
