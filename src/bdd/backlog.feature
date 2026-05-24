Feature: Backlog hygiene
  Untouched work rots: live work is recent, zombies linger, fossils are deletion candidates.

  Scenario Outline: classify a backlog item by how long it is untouched
    Given a backlog item untouched for <age> days
    When it is classified
    Then it is <class>

    Examples:
      | age | class  |
      | 5   | live   |
      | 21  | live   |
      | 22  | zombie |
      | 80  | zombie |
      | 91  | fossil |
      | 200 | fossil |
