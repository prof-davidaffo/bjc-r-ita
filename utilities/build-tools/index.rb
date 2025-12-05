# frozen_string_literal: true

require 'fileutils'
require 'nokogiri'
require 'twitter_cldr'

require_relative 'vocab'
require_relative 'main'
require_relative 'atwork'

FILE_NAME = 'vocab-index'

class Index

  attr_accessor :language, :vocab_url_map, :file_contents

  def initialize(path, language = 'en')
    @parentDir = path
    @language = language
    @vocabList = []
  end

  def language_ext
    @language_ext ||= @language == 'en' ? '' : ".#{@language}"
  end

  def index_filename
    "#{FILE_NAME}#{language_ext}.html"
  end

  def vocabList(list)
    @vocabList = list
  end

  def getAlphabet
    if @language == 'es'
      %w[a b c d e f g h i j k l m n ñ o p q r s t u v w x y z]
    else
      ('a'..'z').to_a
    end
  end

  def alphabet_links(used_letters)
    getAlphabet.map do |letter|
      if used_letters.include?(letter)
        "<a href=\"##{letter.upcase}\">#{letter.upcase}</a>&nbsp;\n"
      else
        "<span>#{letter.upcase}</span>&nbsp;\n"
      end
    end.join
  end

  def generateAlphaOrder(used_letters, output)
    contents = <<-HTML
      <div class="index-letter-link">
        #{alphabet_links(used_letters)}
      </div>
      <div>
        #{output}
      </div>
    HTML
    @file_contents += contents
  end

  def isNonEngChar(vocab, _usedLetters)
    !(isCapital?(vocab[0]) or isLowercase?(vocab[0]))
  end

  def isCapital?(char)
    (char.bytes[0] >= 65 and char.bytes[0] <= 90)
  end

  def isLowercase?(char)
    (char.bytes[0] >= 97 and char.bytes[0] <= 122)
  end

  # alphabet and letter are lowercase and returned vocab word is upper and then lowercase
  def castCharToEng(vocab, usedLetters)
    TwitterCldr::Collation::Collator.new(@language)
    return vocab unless isNonEngChar(vocab, usedLetters)

    letter = vocab[0].downcase
    alpha = getAlphabet.push(letter).localize(@language).sort.to_a
    newLetter = alpha[alpha.index(letter) + 1]
    newLetter.upcase if isCapital?(vocab[0])
    newLetter.upcase + vocab[1..]
  end

  def generate_html_list
    puts "=" * 40
    puts "Generating vocabulary index for language: #{@language}"
    alphabet = getAlphabet
    # TODO: Why do we remove items that start with non-alphabet characters?
    puts "Original vocab list length: #{@vocabList.length}"
    filtered = @vocabList.compact
    puts "After compacting nils: #{filtered.length}"
    # binding.irb
    filtered = filtered.filter { |item| alphabet.include?(item[0].downcase) }
    puts "Filtered vocab list length: #{filtered.length}"
    # Localize using TwitterCldr and sort
    # These terms must match the keys in @vocab_url_map
    terms = filtered.localize(@language).to_a.sort.map { |word| word.strip.gsub(': ', '') }
    used_letters = []
    output = "<ul style=\"list-style-type:square\">\n"
    prev_letter = ''
    terms.each do |vocab|
      original_word = vocab
      vocab = vocab.downcase unless keepCapitalized?(vocab)
      vocab = castCharToEng(vocab, used_letters) if used_letters.any? && isNonEngChar(vocab, used_letters)

      letter = vocab[0].downcase
      if prev_letter != letter
        output += "\n\t\t</li></ol>\n" if used_letters.any?

        prev_letter = letter
        used_letters.push(letter)
        output += <<-HTML
          <li class="index-letter-target" style="list-style-type: none">
            <h2 id="#{letter.upcase}">#{letter.upcase}</h2>
            <ol style="list-style-type: square">
        HTML
      end
      unless @vocab_url_map.key?(original_word)
        puts "Warning: No URL mapping found for vocab word: #{vocab}"
        next
      end
      links = @vocab_url_map[original_word].join(', ')
      output += "\n\t<li>#{vocab} &nbsp; #{links}</li>\n"
    end
    output += "\t\t</ol>\n\t</ul>"
    generateAlphaOrder(used_letters, output)
  end

  # TODO: Rather than appending to files, we should just use a variable to store the HTML content
  def move_and_format_file
    # src = "#{@parentDir}/review/#{index_filename}"
    dst = "#{@parentDir}/#{index_filename}"
    File.delete(dst) if File.exist?(dst)
    # Use Nokogiri to pretty print the HTML -- but only XML mode seems to use proper indentation
    # So, remove the XML doctype and add back the HTML doctype
    pretty_html = <<-HTML
      <!DOCTYPE html>
      <html lang="#{@language}">
        #{write_html_head}
        #{Nokogiri::XML(@file_contents, &:noblanks).document.root}
      </html>
    HTML
    File.write(dst, pretty_html)
  end

  def main
    review_path = "#{@parentDir}/review"
    Dir.chdir(review_path)
    files = Dir.glob('*html').select { |f| File.file? f }
    setup_html_body(files[0], review_path)
    generate_html_list
    add_HTML_end
    move_and_format_file
  end

  def write_html_head
    <<~HTML
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>#{I18n.t('index')}</title>
        <script type="text/javascript" src="/bjc-r/llab/loader.js"></script>
      </head>
    HTML
  end

  def setup_html_body(_copy_file, _file_path)
    @file_contents = <<-HTML
      <body>
        <a style="position: fixed; bottom: 3rem; right: 3rem;"
          class="btn btn-primary btn-lg"
          href="#top">#{I18n.t('back_to_top')}</a>&nbsp;
    HTML
  end

  def add_HTML_end
    ending = "</div>\n</body>\n</html>"
    # return unless File.exist?(index_filename)
    @file_contents += ending
    File.write("#{@parentDir}/review/#{index_filename}", @file_contents)
  end

  # TODO: Mimic ActiveSupport's inflector methods
  def keepCapitalized?(vocab)
    capitals = ['IP', 'DDoS', 'SSL', 'TLS', 'TCP', 'IA', 'IPA', 'PCT', 'PI', 'AI', 'ADT', 'API',
                'Creative Commons', 'ISPs', 'Commons', 'Creative', 'Boolean', 'Booleano']
    capitals.each do |item|
      if vocab.match?(item)
        return true
      elsif vocab.match?(/\(.+\)/)
        return true
      end
    end
    false
  end
end
