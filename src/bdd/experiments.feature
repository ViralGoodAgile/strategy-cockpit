Feature: EBM goals and experiments — the empirical ladder
  An EBM practitioner runs the strategy as a hierarchy of goals tested by experiments. A
  Strategic Goal decomposes into Intermediate Goals, each pursued through Immediate Tactical
  Goals run as experiments — every one with a hypothesis, the value-area measure it intends to
  move, and a clear outcome: validated, invalidated or unsure.

  Scenario: the ladder has the three EBM levels
    Given the strategy's goal ladder
    Then it has a Strategic Goal
    And the Strategic Goal has Intermediate Goals
    And each Intermediate Goal has Immediate Tactical Goals run as experiments

  Scenario: every experiment is a falsifiable bet on a measure
    Given the goal ladder's experiments
    Then each carries a "we believe" hypothesis
    And each names the value-area measure it intends to move

  Scenario: outcomes are scored validated, invalidated or unsure
    Given the goal ladder's experiments
    Then each is labelled validated, invalidated or unsure
    And the tally sums to the number of experiments

  Scenario: the Strategic Goal names the Key Value Area it chases
    Given the Strategic Goal
    Then it is tied to one of the four Key Value Areas
