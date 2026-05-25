Feature: Time travel across the triad and radar views
  Some instruments are dispositional — what matters is the movement over time, not any single
  snapshot. The triad and radar views become movies: a synthetic history is generated, oldest
  first, ending at "now", and a shared transport plays or scrubs it. The cockpit shows the
  motion; people read the trajectory.

  Scenario: the triad movie runs oldest-first and ends at now
    Given a Cynefin triad
    When its history is generated over 6 periods
    Then there are 6 periods, the last labelled "now"
    And the last period's stories match the triad's current signification

  Scenario: scrubbing a triad to an earlier period shows a different cloud
    Given a triad movie
    When I compare the earliest period to now
    Then the centroid has moved between them

  Scenario: playing a triad walks the centroid from the prior lean toward the current lean
    Given a triad whose current lean differs from its prior
    When the movie plays from oldest to now
    Then the earliest period leans toward the prior pole
    And the latest period leans toward the current pole

  Scenario: a captured story appears only in the "now" period
    Given a triad movie and a story I signified
    When I view an earlier period
    Then my story is not among its dots
    And viewing "now" includes my story

  Scenario: the drift line connects a period to the one before it
    Given a triad movie
    When I view any period after the first
    Then it carries the previous period's stories as the prior cloud
    And the first period has no prior cloud

  Scenario: the radar movie ends at now equal to the live scope
    Given the radar
    When its history is generated over 6 periods
    Then the last period is labelled "now"
    And its impediments are exactly today's impediments

  Scenario: an impediment resolved since is present early and gone by now
    Given a radar movie
    Then an earlier period carries an impediment that "now" does not

  Scenario: impediments emerge over time, so earlier periods are smaller
    Given a radar movie
    Then the earliest period has fewer impediments than now

  Scenario: every blip keeps a scope level and a valid severity, never a name
    Given a radar movie
    Then every impediment in every period has a scope level and a high, med or low severity
    And no impediment is labelled with a person's name

  # —— the snapshot widgets travel too ——
  Scenario: weak signals surface over time
    Given the weak signals
    Then fewer have surfaced an earlier period back than now

  Scenario: the mandate gap narrows toward now
    Given the mandate gaps now
    Then they are wider an earlier period back

  Scenario: data hygiene matures toward now
    Given the hygiene ledger now
    Then more signals are stale an earlier period back
