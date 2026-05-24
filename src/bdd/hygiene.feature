Feature: Data hygiene ledger
  Crap in, crap out — the cockpit ranks every signal by how much to trust it.

  Scenario: the ledger lists every signal, worst-first
    Given the hygiene ledger
    Then it lists nine signals
    And they are ordered least-trustworthy first
    And the present-but-stale count is the total minus the fresh count
