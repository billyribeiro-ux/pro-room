//! Small shared helpers.

/// Turn an arbitrary string into a URL-safe slug: lowercase ASCII alphanumerics,
/// with runs of other characters collapsed to single hyphens and trimmed.
#[must_use]
pub fn slugify(input: &str) -> String {
    let mut slug = String::with_capacity(input.len());
    let mut prev_dash = false;
    for ch in input.trim().chars() {
        if ch.is_ascii_alphanumeric() {
            slug.push(ch.to_ascii_lowercase());
            prev_dash = false;
        } else if !prev_dash && !slug.is_empty() {
            slug.push('-');
            prev_dash = true;
        }
    }
    slug.trim_end_matches('-').to_owned()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn slugifies() {
        assert_eq!(slugify("  Morning  Scalps!! "), "morning-scalps");
        assert_eq!(slugify("ES / NQ Futures"), "es-nq-futures");
        assert_eq!(slugify("***"), "");
    }
}
