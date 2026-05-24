Feature: Product outcomes
  Whether the product is moving customers' world toward intent — read through the PIRATE
  funnel (AARRR) and HEART, the customer's own voice, and the demand still open.

  Scenario Outline: the AARRR funnel covers every PIRATE stage
    Given the product outcomes
    Then the AARRR lens includes a "<stage>" metric

    Examples:
      | stage       |
      | Acquisition |
      | Activation  |
      | Retention   |
      | Referral    |
      | Revenue     |

  Scenario Outline: the HEART lens covers every experience quality
    Given the product outcomes
    Then the HEART lens includes a "<quality>" metric

    Examples:
      | quality      |
      | Happiness    |
      | Engagement   |
      | Adoption     |
      | Retention    |
      | Task success |

  Scenario: every metric leads with direction of travel, not a target
    Given the product outcomes
    Then every metric has a current and prior value so a trend is computable
    And no metric declares a target or threshold

  Scenario: customer sense-making is a Cynefin triad that has drifted
    Given the product outcomes
    Then the customer triad has three positive poles
    And it currently leans toward "Removed friction"
    And it has drifted from "Sparked delight"

  Scenario: unserved jobs are customer jobs-to-be-done
    Given the product outcomes
    Then each is phrased as a customer job-to-be-done
    And each carries evidence
    And they are uniquely ranked
