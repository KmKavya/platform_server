module.exports = (grunt) => {
  grunt.initConfig({
    env: {
      test: {
        DEBUG: "evolvus*"
      }
    },
    mochaTest: {
      test: {
        options: {
          reporter: "mocha-sonar-reporter"
        },
        src: "test/**/*.test.js"
      }
    },
    jshint: {
      options: {
        "esversion": 6
      },
      files: {
        src: ["routes/*.js", "test/**/*.test.js", "gruntfile.js", "server.js"]
      }
    },
    watch: {
      files: ["<%= jshint.files.src %>"],
      tasks: ["jshint"]
    }
  });

  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks("grunt-env");
  grunt.loadNpmTasks("grunt-mocha-test");

  grunt.registerTask("default", ["jshint", "env:test", "mochaTest"]);
};
