Feature: SenseMaker integrity — distribution, disposition and vector
  A triad is read by the SHAPE of its fragments, not just their average. A split cloud's mean
  sits in an empty middle and misleads; an anomaly at the edge can matter more than the centre;
  and what counts is the direction of travel, measured as a vector, not the absolute position.

  Scenario: a split cloud is flagged so the mean is not trusted
    Given fragments clustered in two opposite corners
    Then the distribution is reported as split

  Scenario: a single tight cluster is not called split
    Given fragments gathered in one place
    Then the distribution is not reported as split

  Scenario: an anomaly far from the cloud is surfaced as an outlier
    Given a cloud with one fragment far from the rest
    Then that fragment is surfaced as an outlier
    And it is never dropped from the distribution

  Scenario: too few fragments to call anything an outlier
    Given only two fragments
    Then no fragment is called an outlier

  Scenario: drift is measured as a vector — direction and magnitude
    Given a prior cloud near one pole and a current cloud near another
    Then the drift points toward the pole that gained weight
    And the shift is significant

  Scenario: a tiny move is reported as no significant shift
    Given a prior and current cloud almost on top of each other
    Then the drift is not significant
