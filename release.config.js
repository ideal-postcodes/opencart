module.exports = {
  plugins: [
    // @semantic-release/commit-analyzer
    // analyzeCommits: Determine the type of release by analyzing commits with conventional-changelog
    "@semantic-release/commit-analyzer",

    // "semantic-release-replace-plugin"
    // Replaces version number in readme.txt and uk-address-postcode-validation
    [
      "semantic-release-replace-plugin",
      {
        replacements: [
          {
            files: ["src/install.json"],
            from: "<version>.*</version>",
            to: "<version>${nextRelease.version}</version>",
            results: [
              {
                file: "src/install.json",
                hasChanged: true,
                numMatches: 1,
                numReplacements: 1,
              },
            ],
            countMatches: true,
          },
        ],
      },
    ],

    // @semantic-release/release-notes-generator
    // generateNotes: Generate release notes for the commits added since the last release with conventional-changelog
    "@semantic-release/release-notes-generator",

    // @semantic-release/changelog
    // verifyConditions: Verify the presence and the validity of the configuration
    // prepare: Create or update the changelog file in the local project repository
    "@semantic-release/changelog",

    // @semantic-release/git
    // verifyConditions: Verify the presence and the validity of the Git authentication and release configuration
    // prepare: Push a release commit and tag, including configurable files
    [
      "@semantic-release/git",
      {
        assets: ["install.json", "CHANGELOG.md"],
      },
    ],

    // @semantic-release/github
    // verifyConditions: Verify the presence and the validity of the GitHub authentication and release configuration
    // publish: Publish a GitHub release
    // success: Add a comment to GitHub issues and pull requests resolved in the release
    // fail: Open a GitHub issue when a release fails
    [
      "@semantic-release/github",
      {
        assets: [
          {
            path: ["idealpostcodes.ocmod.zip"],
            label: "Ideal Postcodes Open Cart Module ${nextRelease.version}"
          },
        ],
      },
    ],
  ],
  tagFormat: "${version}",
};
