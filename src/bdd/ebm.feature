Feature: Evidence-Based Management — value over output
  An EBM practitioner reads the cockpit in four Key Value Areas — Current Value, Unrealized
  Value, Time to Market and Ability to Innovate — and judges OUTCOMES, not activity. Every
  measure leads with its direction of travel (the trend), never a target.

  Scenario: all four Key Value Areas are represented
    Given the cockpit's value areas
    Then Current Value, Unrealized Value, Time to Market and Ability to Innovate are all present

  Scenario Outline: a measure leads with direction of travel
    Given a metric whose series runs "<from>" to "<to>" where "<better>" is better
    Then its EBM direction reads "<direction>"
    Examples:
      | from | to  | better | direction |
      | 100  | 140 | higher | improving |
      | 140  | 100 | higher | worsening |
      | 60   | 40  | lower  | improving |
      | 40   | 60  | lower  | worsening |
      | 50   | 50  | higher | flat      |

  Scenario: Unrealized Value is read as the open-jobs gap, not a number
    Given the cockpit's value areas
    Then Unrealized Value names the unserved customer jobs still open

  Scenario: a measure is an outcome, never an output count
    Given the cockpit's value areas
    Then no measure is labelled with story points, stories shipped or velocity
