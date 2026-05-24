Feature: Triad signification capture — fit for SenseMaker
  Survey takers signify their own stories onto a triad; the cockpit shows the dots and people
  interpret them. Capture follows Cynefin / SenseMaker discipline (Snowden): a story is told
  first, then placed freely across three positive poles; abstention is always allowed;
  identity is a segment, never a person; and a contributor can revise or withdraw their own
  signification. This holds for every triad in the cockpit.

  Scenario: the cockpit can signify every one of its triads
    Given the signifiable triads
    Then they cover the Cynefin set, the customer voice and the strategy triads
    And every triad offers exactly three positive poles
    And every triad id is unique

  Scenario Outline: a signification needs both a told story and a free placement
    Given the "<triad>" triad
    When only a short fragment is written
    Then signification is blocked
    When a real story is written but not placed
    Then signification is still blocked
    When the story is placed in the triangle
    Then signification is allowed

    Examples:
      | triad                 |
      | Sense-making          |
      | Learning              |
      | Voice                 |
      | Customer sense-making |
      | Direction             |
      | Integrity             |
      | Judgement             |
      | Ownership             |

  Scenario Outline: every triad allows "not applicable"
    Given the "<triad>" triad
    When the respondent marks it not applicable
    Then they can signify with no story and no placement
    And the abstention is recorded but never plotted as a dot

    Examples:
      | triad                 |
      | Sense-making          |
      | Learning              |
      | Voice                 |
      | Customer sense-making |
      | Direction             |
      | Integrity             |
      | Judgement             |
      | Ownership             |

  Scenario Outline: a signified story is plotted as the contributor's own distinct dot
    Given the "<triad>" triad
    When the respondent signifies a story
    Then that triad gains one plottable story
    And it is flagged as captured, so it draws apart from seed stories

    Examples:
      | triad                 |
      | Sense-making          |
      | Customer sense-making |
      | Ownership             |

  Scenario: a captured story merges into a real triad as a current-period dot
    Given the "Sense-making" triad has prior and current seed stories
    When a story is signified onto it toward the first pole
    Then the triad shows one more current-period story than before
    And the new story is a current-period placement

  Scenario: placement is free and dispositional, not a Likert score
    Given a point dropped anywhere inside the triangle
    When it is converted to a placement
    Then each of the three weights lies between zero and one
    And the three weights sum to one

  Scenario: the contributor identifies a segment, never a named individual
    Given the signify segments
    Then none of them is a personal name

  Scenario: the contributor can revise their own signification without adding a record
    Given a signified story placed toward the first pole
    When the contributor re-places it toward the third pole
    Then the merged triad plots the new placement
    And the number of captured stories is unchanged

  Scenario: withdrawing a signification removes exactly that one
    Given two signified stories on a triad
    When the contributor withdraws the first
    Then one signified story remains
    And it is the second story

  Scenario: a triad reads composite drift, not individual scores
    Given a triad whose current stories lean to a different pole than the prior ones
    When its lean is read for each period
    Then the current lean differs from the prior lean

  Scenario Outline: interpretations are attributed to roles, by people not the cockpit
    Given the "<triad>" triad's interpretations
    Then each is attributed to a role
    And none is attributed to a named individual

    Examples:
      | triad                 |
      | Sense-making          |
      | Customer sense-making |
      | Direction             |
