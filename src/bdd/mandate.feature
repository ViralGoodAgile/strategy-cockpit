Feature: Mandate gap
  The distance between where a team is authorised and where its work actually sits.

  Scenario Outline: distance between authorised and actual mandate
    Given a team authorised at <authorised>
    And work that implies <actual>
    When the mandate gap is computed
    Then the gap is <gap> levels

    Examples:
      | authorised | actual | gap |
      | C          | F      | 3   |
      | F          | C      | -3  |
      | D          | D      | 0   |
      | A          | I      | 8   |
