module.exports = function(grunt) {
    grunt.initConfig({
		compress: {
			dist: {
				options: {
					archive: 'dist/WpQuestetraAddonShortcode.zip'
				},
				files: [{expand:true, src:'**', cwd:'WpQuestetraAddonShortcode'}]
			}
		},
		less:{
            develop: {
                options: {
                    compress: false
                },
                files: [
                {"WpQuestetraAddonContent/style.css": "src/css/style.less"},
                {"WpQuestetraAddonContent/addonBrowser.css": "src/css/addonBrowser.less"}
                ]
            }
        }
    });
    //grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-contrib-less');

    //grunt.registerTask('_default', ['less:develop', 'compres:dist']);
};