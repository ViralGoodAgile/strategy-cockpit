Feature: Loop closure
  The return path (Reality to Intent) closes only when Intent is revised after reality moves.

  Scenario: open when no version is saved
    Given no saved versions
    When loop closure is evaluated
    Then the return path is open

  Scenario Outline: closure depends on whether Intent changed
    Given a version with intent <first>
    And a later version with intent <second>
    When loop closure is evaluated
    Then the return path is <state>

    Examples:
      | first  | second  | state  |
      | same   | same    | open   |
      | before | revised | closed |
