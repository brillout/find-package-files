const assert_internal = require('reassert/internal');
const assert_usage = require('reassert/usage');
//const glob = require('glob');
const ignore_module = require('ignore');
const glob_gitignore = require('glob-gitignore');
const find_up_module = require('find-up');
const path_module = require('path');
const fs = require('fs');

module.exports = findPackageFiles;

function findPackageFiles(filename, {only_dir, no_dir, cwd, ignoreSubPackages}) {
    assert_usage(!filename.includes('/'));
    assert_usage(path_module.isAbsolute(cwd));

    const glob_pattern = '**/'+filename+(only_dir ? '/' : '');

    const glob_options = {
        cwd,
        nodir: no_dir, // doesn't seem to always work in `glob-gitignore` and `glob`
        ignore: get_ignore({cwd, ignoreSubPackages}),
    };

    const paths_found = (
        /*
        glob.sync(glob_pattern, glob_options)
        /*/
        glob_gitignore.sync(glob_pattern, glob_options)
        //*/
        .map(relative_path => path_module.join(cwd, relative_path))
    );
    assert_internal(paths_found.length>=0 && paths_found.every(path_found => path_found.startsWith('/')), paths_found);
    return paths_found;
}

function get_ignore({cwd, ignoreSubPackages}) {
    const ignore = ignore_module();

    const gitignore = get_gitignore_content({cwd});
    const gitignore_content = get_gitignore_content({cwd}) || 'node_modules/';
    ignore.add(gitignore_content);

    if( ignoreSubPackages ) {
        const packageJsonFiles = findPackageFiles('package.json', {cwd, no_dir: true});
        const subPackages = (
            packageJsonFiles
            .map(packageJsonFile => path_module.dirname(packageJsonFile))
            .filter(subPackageRoot => subPackageRoot!==cwd)
            .map(subPackageRoot => path_module.relative(cwd, subPackageRoot))
            .map(subPackagePath => subPackagePath.split(path_module.sep).join('/')+'/')
        );
        ignore.add(subPackages.join('\n'));
    }

    return ignore;
}

function get_gitignore_content({cwd}) {
    const gitignore_path = find_up('.gitignore', {cwd, no_dir: true});

    let gitignore_content = null;
    try {
        gitignore_content = fs.readFileSync(gitignore_path).toString();
    } catch(e) {}

    return gitignore_content;
}

function find_up(filename, {only_dir, no_dir, cwd}) {
    assert_internal(filename);
    assert_internal(cwd.startsWith('/'));

    /* TODO
    assert_not_implemented(!only_dir);
    assert_not_implemented(!no_dir);
    */

    const found_path = find_up_module.sync(filename, {cwd});

    assert_internal(found_path===null || found_path.constructor===String && found_path.startsWith('/'));

    return found_path;
}
