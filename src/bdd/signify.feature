Feature: Signify capture — manage a survey taker's stories
  A survey taker signifies stories into a triad and can revise or remove their own.
  The cockpit only ever shows the dots; "not applicable" is recorded but never plotted.

  Scenario: a captured story is folded into its triad as a current placement
    Given a triad with one prior story
    When a survey taker captures a story placed toward Probe
    Then the triad shows two stories
    And the captured story is a current-period placement

  Scenario: editing a captured story moves its dot
    Given a captured story placed toward Probe
    When the survey taker re-places it toward Practice
    Then the merged triad plots the new placement
    And the story keeps its identity

  Scenario: marking a captured story not-applicable keeps the record but drops its dot
    Given a captured story placed toward Probe
    When the survey taker marks it not applicable
    Then the record is still kept
    And the triad plots no dot for it

  Scenario: deleting a captured story removes it from the triad
    Given two captured stories on a triad
    When the survey taker deletes the first
    Then one captured story remains
    And the triad plots only the remaining dot
