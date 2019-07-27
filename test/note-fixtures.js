function makeNotesArray() {
    return [
        {
          id: 1,
          name: "Test House Plan",
          bedrooms: 4,
          bathrooms: 2,
          sq_ft: 2000,
          note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.'  
          },
          {
            id: 2,
            name: "Test House Plan",
            bedrooms: 3,
            bathrooms: 2,
            sq_ft: 2060,
            note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' 
          },
          {
            id: 3,
            name: "Test House Plan",
            bedrooms: 2,
            bathrooms: 2,
            sq_ft: 1050,
            note: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit.' 
          }
    ]
}

function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    name: 'Bad note',
    bedrooms: 5,
    bathrooms: 3,
    sq_ft: 1000,
    note: 'Naughty naughty very naughty <script>alert("xss");</script>'
  }
  const expectedNote = {
    ...maliciousNote,
    note: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousNote,
    expectedNote,
  }
}

module.exports = {
    makeNotesArray,
    makeMaliciousNote
}