Feature: Flow simulation invariants
  The Theory-of-Constraints movie must obey the physics of a flow system.

  Scenario: the simulation respects capacity and completes monotonically
    Given the flow simulation
    Then no station ever exceeds its active capacity
    And the Done count never decreases
    And every frame names a valid constraint
