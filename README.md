# subreddit-post-tagger
Upload comment-specific styles when mod reports are logged.

## Understanding Templates

When a comment is reported by a moderator, subreddit-post-tagger checks to see if it's in the format 
[command]![optional message]. If so, the template for that command is used to append the required styles.

The template for a given command is the `[command].txt` file in the `templates` folder. If no template for a command
is found, the command will be ignored. The contents of `[command].txt` will be appended to the SASS file 
specified in `settings.json` and committed to the repository.

Your template can reference properties of the Comment object using {{handlebar}} notation. Any properties
wrapped in double-braces will be replaced with the corresponding comment property.

For example, if your template was

```
div.#thing_{{name}} {
   contents: "{{report}}";
}
```

`{{name}}` would be replaced with the comment's name, and `{{report}}` would be replaced with the optional message
provided by the moderator. 

A full list of properties can be found in the `example-report.txt` file.
